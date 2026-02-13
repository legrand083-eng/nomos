const bcrypt = require('bcrypt');

const password = 'Nomos2026!';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL UPDATE statement:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE id IN (1, 2, 3, 4, 5, 6);`);
});
