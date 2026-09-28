import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let options = {
    thresholds: {
        http_req_failed: ['rate<0.05']
    }    
};

const account = '#{AzureStorageAccountName}#';
const queue = '#{AzureStorageQueueName}#';
const apiVersion = '#{AzureStorageApiVersion}#';
const sas = '#{AzureStorageSASToken}#';

export default function () {
  const url = `https://${account}.queue.core.windows.net/${queue}/messages?${sas}`;
  const pedidoId = uuidv4();

  const payload = `<QueueMessage><MessageText>{"pedidoId":"${pedidoId}","acao":"processar"}</MessageText></QueueMessage>`;

  const response = http.post(url, payload, {
    headers: {
      'x-ms-version': apiVersion,
      'Content-Type': 'application/xml',
    },
  });

  check(response, {
    'send queue: o status é 201 Created': (res) => res.status === 201
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "k6-reporter.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}