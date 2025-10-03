import bcrypt from "bcryptjs";

// export const hashPassword = async (password: string) => {
//     const salt = await bcrypt.genSalt(10);
//     return await bcrypt.hash(password, salt);
// }

// export const validatePswd = async (providedPswd: string, storedPswd: string) => {
//     return await bcrypt.compare(providedPswd, storedPswd);
// }


export const hashPassword = async (password: string) => {
  const salt = await new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      else resolve(salt);
    });
  });

  return await new Promise<string>((resolve, reject) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

export const validatePassword = async (password: string, hash: string) => {
  return await new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(password, hash, (err, same) => {
      if (err) reject(err);
      else resolve(same);
    });
  });
};



