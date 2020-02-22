# ldap-passwd

Simple password util for ldap userPassword, inspired by https://github.com/peppelinux/pySSHA-slapd

## What is it

This is a simple lib and cli tool for generating or verifying the ldap userPassword.

## How to use it

### CLI usage

1. npm i -g ldap-passwd or yarn global add ldap-passwd
2. ldap-passwd

### LIB usage

First install this package via `npm i ldap-passwd` or `yarn add ldap-passwd`, then import it in your app.

```js
const { checkPassword, hashPassword } = require('../index');
// ......
const is_valid = checkPassword(plain_password, hashed_check_password);
const generated_hashed_password = hashPassword('SHA1', plain_password);
```

## Snapshot

[![asciicast](https://asciinema.org/a/RfuVkjN8UFgd64MrP5DDetv9M.svg)](https://asciinema.org/a/RfuVkjN8UFgd64MrP5DDetv9M)

## License

MIT License

Copyright (c) 2020 liudonghua
