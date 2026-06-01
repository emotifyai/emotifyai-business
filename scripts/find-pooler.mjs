import pg from 'pg';
const { Client } = pg;

const regions = [
  'us-east-1', 'us-west-1', 'us-west-2', 
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1',
  'sa-east-1', 'ca-central-1'
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const client = new Client({
    connectionString: `postgresql://postgres.dnywneqoukwqhwxpkvta:9LF9YmQbjkYHHYBV@${host}:5432/postgres`
  });
  
  try {
    await client.connect();
    console.log(`✅ Success in region: ${region}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('tenant/user') || err.message.includes('ENOTFOUND')) {
      // wrong region
    } else {
      console.error(`Error in ${region}:`, err.message);
    }
    return false;
  }
}

async function main() {
  console.log('Searching for correct pooler region...');
  for (const region of regions) {
    const success = await checkRegion(region);
    if (success) {
      console.log(`Found pooler region: aws-0-${region}`);
      process.exit(0);
    }
  }
  console.log('Failed to find region');
}
main();
