import axios from 'axios';
import deleteSchema from './deleteSchema.js';

const url = 'https://nildb-lpjp.nillion.network';

const bearer = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE3MzkwMTMxMzYsImV4cCI6MTczOTAxNjczNiwiaXNzIjoiZGlkOm5pbDp0ZXN0bmV0Om5pbGxpb24xbHBydW5wNDBjZHRyYXpoNWc2N3psZXZ3aG5mNjQ0ZDl4dnkya3giLCJhdWQiOiJkaWQ6bmlsOnRlc3RuZXQ6bmlsbGlvbjE2N3BnbHY5azdtNGdqMDVyd2o1MjBhNDZ0dWxrZmYzMzJ2bHBqcCJ9.Md-ir_gMk47TIxmFQhyJIu4_xdahR7oiUds6LJplvhtdclaRN-dISRTeODkIREpJpTrfgTd7wE52ElK61i3-2w';

const readSchema = async () => {
    try {
        const config = {
            method: 'get',
            maxBodyLength: "Infinity",
            url: `${url}/api/v1/schemas`,
            headers: { 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${bearer}`
        }
    };

        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to read schema:', error.message);
        process.exit(1);
    }
}

const schemas = await readSchema();


for (const schema of schemas.data) {

    console.log(`Deleting schema ${schema._id}`);
    deleteSchema(schema._id, url, bearer);
}