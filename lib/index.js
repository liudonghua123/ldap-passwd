const crypto = require('crypto');
const debug = require('debug')('ldap-passwd:lib');

const randomValueHex = len =>
  crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex')
    .slice(0, len);

const getEncoder = encoder_name => {
  let fixedEncoderName = encoder_name.startsWith('SS') ? encoder_name.substr(1) : encoder_name;
  if (fixedEncoderName === 'SHA') {
    fixedEncoderName = 'SHA1';
  }
  return crypto.createHash(fixedEncoderName);
};

const sshaSplit = (ssha_password, encoder, salt_size = 16, suffixed = true) => {
  debug('sshaSplit');
  let payload, salt, hash_type;
  const hexedPassword = Buffer.from(ssha_password, 'base64').toString('hex');
  if (salt_size) {
    if (suffixed) {
      payload = hexedPassword.substr(0, hexedPassword.length - salt_size);
      salt = hexedPassword.substr(-salt_size);
    } else {
      salt = hexedPassword.substr(0, hexedPassword.length - salt_size);
      payload = hexedPassword.substr(-salt_size);
    }
    hash_type = `{${encoder.toUpperCase()}}`;
  } else {
    salt = '';
    payload = hexedPassword;
  }
  debug(
    `sshaSplit: \n${JSON.stringify(
      {
        salt,
        payload,
        hash_type,
        ssha_password,
      },
      null,
      2
    )}`
  );
  return {
    salt,
    payload,
    hash_type,
    ssha_password,
  };
};

const sshaEncoder = (encoder, password, salt = null, salt_size = 16, suffixed = true) => {
  debug('sshaEncoder');
  if (!salt) {
    salt = randomValueHex(salt_size);
  }
  encoder_func = getEncoder(encoder);
  let digest;
  if (suffixed) {
    digest = encoder_func
      .update(Buffer.concat([Buffer.from(password, 'utf8'), Buffer.from(salt, 'hex')]))
      .digest('hex');
  } else {
    digest = encoder_func
      .update(Buffer.concat([Buffer.from(salt, 'utf8'), Buffer.from(password, 'hex')]))
      .digest('hex');
  }
  debug(`sshaEncoder: \n${JSON.stringify({ salt, digest, password }, null, 2)}`);
  return { salt, digest, password };
};

const hashPassword = (encoder, password, salt = null, salt_size = 16, suffixed = true) => {
  debug('hashPassword');
  sshaenc = sshaEncoder(encoder, password, salt, salt_size, suffixed, debug);
  let digestBuffer;
  if (salt_size) {
    if (suffixed) {
      digestBuffer = Buffer.concat([Buffer.from(sshaenc.digest, 'hex'), Buffer.from(sshaenc.salt, 'hex')]);
    } else {
      digestBuffer = Buffer.concat([Buffer.from(sshaenc.salt, 'hex'), Buffer.from(sshaenc.digest, 'hex')]);
    }
  } else {
    digestBuffer = Buffer.from(sshaenc.digest, 'hex');
  }
  const hash_type = `{${encoder.toUpperCase()}}`;
  debug(`hashPassword: \n${JSON.stringify({ hash_type, digestBuffer })}`);
  return `${hash_type}${digestBuffer.toString('base64')}`;
};

const checkPassword = (password, ssha_password, salt_size, suffixed) => {
  debug(`checkPassword`);
  ssha_p_splitted = ssha_password.split('}');
  encoder = ssha_p_splitted[0].substr(1);
  cleaned_ssha_password = ssha_p_splitted[1];
  sshasplit = sshaSplit(cleaned_ssha_password, encoder.toLowerCase(), salt_size, suffixed, debug);
  const { payload, salt } = sshasplit;
  ssha_hash = hashPassword(encoder, password, salt, salt_size, suffixed, debug);
  debug(`checkPassword: \n${JSON.stringify(ssha_hash, null, 2)}`);
  return ssha_hash.split('}')[1] === ssha_password.split('}')[1];
};

module.exports = {
  checkPassword,
  hashPassword,
};
