const _unionWith = require("lodash.unionwith");
const _isEqual = require("lodash.isequal");

function getRelationById(relations = {}, uid) {
  return (Object.keys(relations).filter(relationId =>
    relations[relationId].find(item => item.uid === uid)) || [])
    .map(id => parseInt(id, 10))
    .shift();
}

function mergeRelation(currRelations, relations) {
  const current = currRelations ? currRelations : [];

  let relationId = Array.from(
    new Set(
      relations.reduce(
        (itemArr, item) => itemArr.concat(getRelationById(current, item.uid)),
        []
      )
    )
  ).shift();

  if (typeof relationId === "undefined") {
    relationId = current.length;
  }

  const updated = relations.map(item => {
    const { uid, type } = item;
    if (!uid || !type) {
      throw Error("Each relation item should have uid and type", item);
    }
    return {
      ...item,
      relationId
    };
  });
  current[relationId] = _unionWith(current[relationId], updated, _isEqual);
  return current;
}

function getRelation(relations = {}, relationId, type) {
  const relArr = relations[relationId] || [];
  return relArr.filter(item => item.type === type);
}

function getRelatedByType(relations, uid, type) {
  return getRelation(relations, getRelationById(relations, uid), type);
}

module.exports = {
  mergeRelation,
  getRelation,
  getRelationById,
  getRelatedByType
};
