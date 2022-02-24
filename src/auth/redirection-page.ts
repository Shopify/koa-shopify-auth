import fs from 'fs';
import path from 'path';

const APP_BRIDGE_SCRIPT = fs.readFileSync(
  path.resolve(`${__dirname}/../app-bridge-2.0.12.js`),
);

export default function redirectionScript({origin, redirectTo, apiKey, host}) {
  return `
    <script>${APP_BRIDGE_SCRIPT}</script>
    <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', function() {
        if (window.top === window.self) {
          // If the current window is the 'parent', change the URL by setting location.href
          window.location.href = "${redirectTo}";
        } else {
          // If the current window is the 'child', change the parent's URL with postMessage
          var AppBridge = window['app-bridge'];
          var createApp = AppBridge.default;
          var Redirect = AppBridge.actions.Redirect;
          var app = createApp({
            apiKey: "${apiKey}",
            host: "${host}",
            shopOrigin: "${encodeURI(origin)}",
          });
          var redirect = Redirect.create(app);
          redirect.dispatch(Redirect.Action.REMOTE, "${redirectTo}");
        }
      });
    </script>
  `;
}
