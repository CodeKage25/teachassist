// Ambient type declaration for pdfjs-dist (optional dependency).
// When the package is installed these types are overridden by the package's own types.
declare module 'pdfjs-dist' {
  export const version: string
  export const GlobalWorkerOptions: { workerSrc: string }
  export function getDocument(params: { data: ArrayBuffer }): {
    promise: Promise<{
      numPages: number
      getPage(n: number): Promise<{
        getTextContent(): Promise<{ items: { str: string }[] }>
      }>
    }>
  }
}
