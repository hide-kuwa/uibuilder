export const toast = {
  success(message: string) {
    console.log(`[toast:success] ${message}`)
  },
  error(message: string) {
    console.error(`[toast:error] ${message}`)
  },
}
export default toast
