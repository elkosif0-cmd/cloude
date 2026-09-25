const banned = [
  /^ui\//,
  /(^|\/)legacy\//,
  /skosif\.js$/i,
  /skosif\.css$/i,
  /Product360Modal/,
  /SKosifCore\.registerView/
];

export function checkNoLegacy(files) {
  return files.filter((path) => banned.some((rule) => rule.test(path)));
}
