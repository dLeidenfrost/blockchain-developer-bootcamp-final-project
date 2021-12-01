export const getRandomImage = size => {
  const random = Math.trunc(Math.random() * size);
  console.log(random);
  return random || 1;
}
