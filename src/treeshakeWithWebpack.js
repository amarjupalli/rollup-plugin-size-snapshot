// @flow

import webpack from "webpack";
import MemoryFileSystem from "memory-fs";
import { isExternal } from "./utils.js";

const inputName = "__size_snapshot_input__.js";
const bundleName = "__size_snapshot_bundle__.js";
const outputName = "__size_snapshot_output__.js";

export const treeshakeWithWebpack = (code: string): Promise<string> => {
  const inputFS = new MemoryFileSystem();
  const outputFS = new MemoryFileSystem();

  const compiler = webpack({
    entry: `/${inputName}`,
    output: {
      path: "/",
      filename: outputName
    },
    mode: "production",
    externals: [
      (context, request, callback) => {
        if (isExternal(request)) {
          callback(null, "commonjs " + request);
        } else {
          callback();
        }
      }
    ]
  });

  inputFS.writeFileSync(`/${inputName}`, `import {} from '/${bundleName}'`);
  inputFS.writeFileSync(`/${bundleName}`, code);

  compiler.inputFileSystem = inputFS;
  compiler.outputFileSystem = outputFS;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(outputFS.readFileSync(`/${outputName}`, "utf8"));
      }
    });
  });
};
