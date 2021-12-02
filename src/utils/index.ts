import { Process } from '../core/modules/ProcessManager/Process';
import {
  Operation,
  OperationTypes,
} from '../core/modules/ProcessManager/Operation';

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

export function loadTextFile(filePath: string): any {
  // const path = process.cwd().toString() + filePath;

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.toString();
  } catch (e) {
    console.log(e);
    // throw new Error(`Failed to load file from path: ${filePath}`);
  }
}

// export async function readFilesFromDir(dirname) {
//   const ret: Array<string> = [];

//   fs.readdir(dirname, function (err, filenames) {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     filenames.forEach(function (filename) {
//       fs.readFile(dirname + filename, 'utf-8', function (err, content) {
//         if (err) {
//           console.log(err);
//           return;
//         }
//         ret.push(content);
//       });
//     });
//   });

//   return ret;
// }

export function readFilesFromDir(dirname: string): Array<string> {
  const files = [];

  fs.readdirSync(dirname).forEach((filename) => {
    const data = fs.readFileSync(dirname + filename, 'utf-8');
    files.push(data);
  });

  return files;
}
export function generateRandomProcess(): Process {
  const ops: Array<Operation> = [];

  const randNumOps = Math.ceil(Math.random() * (10 - 0) + 0);

  for (let i = 0; i < randNumOps; i++) {
    const op = createRandomOperation();
    ops.push(op);
  }

  const process = new Process(ops);
  return process;
}

function createRandomOperation(): Operation {
  const rand = Math.floor(Math.random() * Object.keys(OperationTypes).length);

  const randomType = OperationTypes[Object.keys(OperationTypes)[rand]];

  const op = new Operation(randomType, 0, 150, 1, 10);

  return op;
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
