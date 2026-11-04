import { Config } from '@remotion/cli/config';

// Use the pre-installed headless shell in this environment. Remove this line
// on a normal machine and Remotion will download its own browser.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);
