export namespace envUtils {
  export function isDev() {
    return process.env.NODE_ENV === 'development';
  }

  export function isProduction() {
    return !isDev();
  }
}
