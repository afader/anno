var _ = require('underscore');
var fs = require('fs');
var Promise = require('bluebird');
Promise.promisifyAll(fs);
var readVectors = function(path, fieldSep, lineSep) {
  fieldSep = fieldSep || '\t';
  lineSep = lineSep || '\n';
  var getData = fs.readFileAsync(path, 'utf8');
  var readLine = line => {
    var fields = line.trim().split(fieldSep);
    var word = fields[0];
    var values = fields.slice(1).map(parseFloat);
    return [ word, values ];
  };
  return getData
    .then(data => data.split(lineSep))
    .filter(line => line.trim())
    .map(readLine)
    .then(_.object)
};
var sum = (a, b) => a + b;
var l2norm = v => Math.sqrt(v.map(x => x * x).reduce(sum));
var sameLength = (v1, v2) => v1.length === v2.length;
var dot = function(v1, v2) {
  if (!sameLength(v1, v2)) throw `vectors have different dimensions: ${v1} and ${v2}`;
  var score = 0;
  for (var i = 0; i < v1.length; i++) {
    score += v1[i] * v2[i];
  }
  return score;
};
var cosine = function(v1, v2) {
  var denom = l2norm(v1) * l2norm(v2);
  if (denom > 0) {
    return dot(v1, v2) / denom;
  } else {
    throw 'cannot measure cosine of zero vector';
  }
};
var addVectors = function(v1, v2) {
  if (!sameLength(v1, v2)) throw `vectors have different dimensions: ${v1} and ${v2}`;
  return v1.map((x, i) => v1[i] + v2[i]);
};
var scaleVector = (s, v) => v.map(x => s * x);
var similarityWithDefault = function(vectors) {
  var sim = similarity(vectors);
  return function(word1, word2) {
    var has1 = _.has(vectors, word1);
    var has2 = _.has(vectors, word2);
    if (has1 && has2) {
      return sim(word1, word2);
    } else if (word1 === word2) {
      return 1.0;
    } else {
      return 0.0;
    }
  };
};
var similarity = vectors => function(word1, word2) {
  return cosine(vectors[word1], vectors[word2]);
};
module.exports = { readVectors, similarity, similarityWithDefault };
