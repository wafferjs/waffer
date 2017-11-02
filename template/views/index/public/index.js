const login = q('.login');
if (login) {
  login.on('click', login.class.toggle.bind(login, 'toggle'));
}
