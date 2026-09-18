// Reduz a imagem (redimensiona + comprime) antes de enviar, pra economizar
// espaço e ficar rápido no celular. Retorna { blob, dataUrl }.
export async function compressImage(file, maxDim = 1400, quality = 0.8) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  let { width, height } = img
  if (width > height && width > maxDim) { height = (height * maxDim) / width; width = maxDim }
  else if (height > maxDim) { width = (width * maxDim) / height; height = maxDim }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
  const outUrl = canvas.toDataURL('image/jpeg', quality)
  return { blob, dataUrl: outUrl }
}
