import { defineConfig, presetMini } from 'unocss';

export default defineConfig({
    presets: [presetMini()],
    rules: [
        // [/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
        // [/^ml-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
    ],
});