import { defineConfig, presetWind4 } from 'unocss';

export default defineConfig({
    presets: [presetWind4()],
    rules: [
        [/^fs-(\d+)$/, ([_, num]) => ({ 'font-size': `${num}px` })],
        // [/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
        // [/^ml-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
    ],
});