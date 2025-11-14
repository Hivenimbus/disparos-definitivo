import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

const hashPromise = (plainText: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plainText, SALT_ROUNDS, (err, hash) => {
      if (err) {
        reject(err)
      } else {
        resolve(hash)
      }
    })
  })
}

const comparePromise = (plainText: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainText, hash, (err, same) => {
      if (err) {
        reject(err)
      } else {
        resolve(same)
      }
    })
  })
}

export const hashPassword = async (plainText: string): Promise<string> => {
  if (!plainText) {
    throw new Error('Senha inválida')
  }

  return hashPromise(plainText)
}

export const verifyPassword = async (plainText: string, hash: string): Promise<boolean> => {
  if (!plainText || !hash) {
    return false
  }

  return comparePromise(plainText, hash)
}

