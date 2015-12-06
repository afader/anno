var Promise = require('bluebird');
var wordVectors = require('../app/word-vectors.js');
var _ = require('underscore');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
describe('wordVectors', function() {
  var path = './test/test-vectors.txt';
  var getVectors = () => wordVectors.readVectors(path);
  describe('#similarity()', function() {
    it('should measure similarity correctly', function() {
      var getSim = getVectors().then(wordVectors.similarity);
      var animalSim = getSim.then(sim => sim('dog', 'cat'));
      var otherSim = getSim.then(sim => sim('dog', 'long'));
      var comparison = Promise.join(animalSim, otherSim, (s, t) => s > t);
      expect(comparison).to.eventually.equal(true, 'sim(dog, cat) > sim(dog, long)');
    });
  });
  describe('#similarityWithDefault()', function() {
    it('should measure similarity for unknown words', function() {
      var getSim = getVectors().then(wordVectors.similarityWithDefault);
      var animalSim = getSim.then(sim => sim('dog', 'cat'));
      var otherSim = getSim.then(sim => sim('dog', 'buffalo'));
      var comparison = Promise.join(animalSim, otherSim, (s, t) => s > t);
      expect(comparison).to.eventually.equal(true, 'sim(dog, cat) > sim(dog, buffalo)');
    });
  });
  describe('#readVectors()', function() {
    it('should read correct words', function() {
      var expectedWords = 'the and a is are has have long short red brown dog hair cat fur'
        .split(' ');
      var getKeys = getVectors().then(_.keys);
      return expect(getKeys).to.eventually.have.members(expectedWords);
    });
    it('should return numeric vectors', function() {
      var getValues = getVectors().then(_.values).then(_.flatten);
      return getValues.map(function(value) {
        return expect(value).to.be.a('number');
      });
    });
    it('should read correct dims', function() {
      var expectedDim = 25;
      var getValues = getVectors().then(_.values);
      return getValues.map(function(vector) {
        return expect(vector).to.have.length(expectedDim);
      });
    });
  });
});
