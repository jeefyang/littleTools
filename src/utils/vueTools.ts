import type { DefineComponent, ExtractPropTypes } from "vue";

export function Component2Props<T>(component: DefineComponent<ExtractPropTypes<T>, any, any, any, any>) {
    return component.props as T;
}