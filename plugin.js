// Ignite CLI plugin for Splashscreen
// ----------------------------------------------------------------------------

const NPM_MODULE_NAME = 'react-native-splash-screen'
const NPM_MODULE_VERSION = '~3.2.0'

const PLUGIN_PATH = __dirname
const APP_PATH = process.cwd()

const add = async function (toolbox) {
  // Learn more about toolbox: https://infinitered.github.io/gluegun/#/toolbox-api.md
  const { ignite, print, filesystem, system } = toolbox
  const packageJSON = require(`${APP_PATH}/package.json`)
  const igniteJSON = require(`${APP_PATH}/ignite/ignite.json`)

  // install an NPM module and link it
  await ignite.addModule(NPM_MODULE_NAME, { link: packageJSON.dependencies['react-native'] < '0.60.0', version: NPM_MODULE_VERSION })
  await system.run('pod install', { cwd: `${APP_PATH}/ios` });

  // iOS install
  ignite.patchInFile(`${APP_PATH}/ios/${packageJSON.name}/AppDelegate.m`, {
    insert: `#import "RNSplashScreen.h"`,
    after: `#import <React/RCTRootView.h>`
  });
  ignite.patchInFile(`${APP_PATH}/ios/${packageJSON.name}/AppDelegate.m`, {
    insert: `    [RNSplashScreen show];\n`,
    before: `return YES;`
  });
  // Android install
  ignite.patchInFile(`${APP_PATH}/android/app/src/main/java/com/${packageJSON.name.toLowerCase()}/MainActivity.java`, {
    insert: `import android.os.Bundle;`,
    before: `import com.facebook.react.ReactActivity;`
  });
  ignite.patchInFile(`${APP_PATH}/android/app/src/main/java/com/${packageJSON.name.toLowerCase()}/MainActivity.java`, {
    insert: `import org.devio.rn.splashscreen.SplashScreen;\n`,
    after: `import com.facebook.react.ReactActivity;`
  });
  ignite.patchInFile(`${APP_PATH}/android/app/src/main/java/com/${packageJSON.name.toLowerCase()}/MainActivity.java`, {
    insert: `  @Override\n  protected void onCreate(Bundle savedInstanceState) {\n    SplashScreen.show(this);\n    super.onCreate(savedInstanceState);\n  }\n`,
    after: `public class MainActivity extends ReactActivity {`
  });
  filesystem.dir(`${APP_PATH}/android/app/src/main/res/layout`);
  filesystem.copy(`${PLUGIN_PATH}/launch_screen.xml`, `${APP_PATH}/android/app/src/main/res/layout/launch_screen.xml`);
  filesystem.copy(`${PLUGIN_PATH}/colors.xml`, `${APP_PATH}/android/app/src/main/res/values/colors.xml`);
  filesystem.dir(`${APP_PATH}/android/app/src/main/res/drawable-mdpi`);
  filesystem.dir(`${APP_PATH}/android/app/src/main/res/drawable-hdpi`);
  filesystem.dir(`${APP_PATH}/android/app/src/main/res/drawable-xhdpi`);
  filesystem.dir(`${APP_PATH}/android/app/src/main/res/drawable-xxhdpi`);
  filesystem.dir(`${APP_PATH}/android/app/src/main/res/drawable-xxxhdpi`);
  filesystem.copy(`${APP_PATH}/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`, `${APP_PATH}/android/app/src/main/res/drawable-mdpi/launch_screen.png`);
  filesystem.copy(`${APP_PATH}/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`, `${APP_PATH}/android/app/src/main/res/drawable-hdpi/launch_screen.png`);
  filesystem.copy(`${APP_PATH}/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`, `${APP_PATH}/android/app/src/main/res/drawable-xhdpi/launch_screen.png`);
  filesystem.copy(`${APP_PATH}/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`, `${APP_PATH}/android/app/src/main/res/drawable-xxhdpi/launch_screen.png`);
  filesystem.copy(`${APP_PATH}/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`, `${APP_PATH}/android/app/src/main/res/drawable-xxxhdpi/launch_screen.png`);

  if (igniteJSON.boilerplate === 'osedea-react-native-boilerplate') {
    ignite.patchInFile(`${APP_PATH}/app/index.tsx`, {
        insert: `import SplashScreen from 'react-native-splash-screen';\n`,
        after: `import React, { Component } from 'react';`
    });
    ignite.patchInFile(`${APP_PATH}/app/index.tsx`, {
        insert: `    componentDidMount() {\n        SplashScreen.hide();\n    }\n`,
        after: `class Root extends Component {`
    });
    await ignite.addModule('@bam.tech/react-native-make', { link: false, dev: true, version: '~1.0.3' })
  } else {
      print.info('Well done! You just need to hide the native splash screen in your JS code now!\n\nimport SplashScreen from \'react-native-splash-screen\';\n\nSplashScreen.hide();');
  }
  print.info('We highly recommend you to check out https://github.com/bamlab/react-native-make/blob/master/docs/set-splash.md to customize your splashscreen!');
  print.info('Also, for more customization on Android, especially, see https://github.com/crazycodeboy/react-native-splash-screen');
}

/**
 * Remove yourself from the project.
 */
const remove = async function (toolbox) {
  // Learn more about toolbox: https://infinitered.github.io/gluegun/#/toolbox-api.md
  const { ignite, print, filesystem } = toolbox
  const packageJSON = require(`${APP_PATH}/package.json`)
  const igniteJSON = require(`${APP_PATH}/ignite/ignite.json`)

  // remove the npm module and unlink it
  await ignite.removeModule(NPM_MODULE_NAME, { unlink: packageJSON.dependencies['react-native'] < '0.60.0' })
  await toolbox.system.run('pod install', { cwd: `${APP_PATH}/ios` })

  // iOS install
  ignite.patchInFile(`${APP_PATH}/ios/${packageJSON.name}/AppDelegate.m`, {
    delete: `#import "RNSplashScreen.h"`,
  });
  ignite.patchInFile(`${APP_PATH}/ios/${packageJSON.name}/AppDelegate.m`, {
    delete: `    [RNSplashScreen show];\n`,
  });
  // Android install
  ignite.patchInFile(`${APP_PATH}/android/app/src/main/java/com/${packageJSON.name.toLowerCase()}/MainActivity.java`, {
    delete: `import android.os.Bundle;`,
  });
  ignite.patchInFile(`${APP_PATH}/android/app/src/main/java/com/${packageJSON.name.toLowerCase()}/MainActivity.java`, {
    delete: `import org.devio.rn.splashscreen.SplashScreen;\n`,
  });
  ignite.patchInFile(`${APP_PATH}/android/app/src/main/java/com/${packageJSON.name.toLowerCase()}/MainActivity.java`, {
    delete: `  @Override\n  protected void onCreate(Bundle savedInstanceState) {\n    SplashScreen.show(this);\n    super.onCreate(savedInstanceState);\n  }\n`,
  });
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/layout`);
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/values/colors.xml`);
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/drawable-mdpi`);
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/drawable-hdpi`);
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/drawable-xhdpi`);
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/drawable-xxhdpi`);
  filesystem.remove(`${APP_PATH}/android/app/src/main/res/drawable-xxxhdpi`);

  if (igniteJSON.boilerplate === 'osedea-react-native-boilerplate') {
    ignite.patchInFile(`${APP_PATH}/app/index.tsx`, {
        delete: `import SplashScreen from 'react-native-splash-screen';\n`,
    });
    ignite.patchInFile(`${APP_PATH}/app/index.tsx`, {
        delete: `    componentDidMount() {\n        SplashScreen.hide();\n    }\n`,
    });
    await ignite.removeModule('@bam.tech/react-native-make', { unlink: false, dev: true })
  } else {
      print.info('Too bad it didn\'t work out between us! Don\'t forget to remove the hide code:\n\nimport SplashScreen from \'react-native-splash-screen\';\n\nSplashScreen.hide();');
  }
}

// Required in all Ignite CLI plugins
module.exports = { add, remove }

