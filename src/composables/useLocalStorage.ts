import { ref, watch } from 'vue'

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
    const ls = window.localStorage;
    const data = ref<T>(defaultValue);
    const dataJson = ls.getItem(key);

    if (dataJson) {
        data.value = JSON.parse(dataJson);
    }

    watch(data, () => {
        ls.setItem(key, JSON.stringify(data.value));
    },{ deep: true });

    return data;
}
