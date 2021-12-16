/* eslint-disable new-cap */
import jsSHA from 'jssha';

// SALT
const SALT = process.env.MY_ENV_VAR;

// Hashing function
// eslint-disable-next-line import/prefer-default-export
export default function (input) {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  const unhashedString = `${input}-${SALT}`;
  shaObj.update(unhashedString);
  return shaObj.getHash('HEX');
}
