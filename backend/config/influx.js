const { InfluxDB } = require("@influxdata/influxdb-client");

const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

const client = new InfluxDB({ url, token });

const writeApi = client.getWriteApi(org, bucket, "ms");
const queryApi = client.getQueryApi(org);

module.exports = { writeApi, queryApi, bucket };
