// vite-imagetools `as=picture` output
declare module '*&as=picture' {
  const pic: {
    sources: Record<string, string>
    img: { src: string; w: number; h: number }
  }
  export default pic
}
