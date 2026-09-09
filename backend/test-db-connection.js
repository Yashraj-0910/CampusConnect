const { Client } = require('pg');

const commonPasswords = ['', 'postgres', 'admin', 'root', '123456', '1234'];

async function testConnection() {
  for (const pwd of commonPasswords) {
    console.log(`Testing password: "${pwd}"...`);
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pwd,
      database: 'postgres'
    });

    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Password is: "${pwd}"\n`);
      await client.end();
      return pwd;
    } catch (err) {
      console.log(`❌ Failed with password "${pwd}": ${err.message}`);
    }
  }
  console.log('\n❌ All tested passwords failed. Please check your PostgreSQL installation.\n');
  return null;
}

testConnection();
