import { defineConfig, presetWind4 } from 'unocss';

export default defineConfig({
    presets: [presetWind4()],
    rules: [
        // [/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
        // [/^ml-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
    ],
});