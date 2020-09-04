import {createPackage, Runtime} from '@sewing-kit/config';
import {javascript} from '@sewing-kit/plugin-javascript';
import {typescript, workspaceTypeScript} from '@sewing-kit/plugin-typescript';
import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {buildFlexibleOutputs} from '@sewing-kit/plugin-package-flexible-outputs';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  // pkg.entry({
  //   name: 'matchers',
  //   root: './matchers.entry',
  // });
  // pkg.entry({
  //   name: 'testing',
  //   root: './testing.entry',
  // });
  pkg.use(
    buildFlexibleOutputs(),
    jest(),
    eslint(),
    javascript(),
    typescript(),
    workspaceTypeScript(),
  );
});
