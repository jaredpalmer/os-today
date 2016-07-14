import db from './db'
import fetch from 'isomorphic-fetch'
import * as Repo from './repo'
const Promise = require('bluebird')

export const getFollowing = (username) => {
  return fetch(`https://api.github.com/users/${username}/following`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
}

export const follow = (user, friend) => {
  const session = db.session()
  const q = `
    MATCH (u:User { login: { user } }), (f:User { login: { friend } })
    MERGE (u)-[r:FOLLOWING]->(f)
    RETURN f
  `
  return session
    .run(q, { user: user, friend: friend })
    .then((result) => {
      session.close()
      return result.records[0].get('f').properties
    })
}

export const create = (options) => {
  const session = db.session()
  const q = `
    CREATE (u:User { options })
    RETURN u
  `
  return session
    .run(q, { options })
    .then(result => {
      // session.close()
      return result.records[0].get('u').properties
    })
}

export const getStarred = (user) => {
  return fetch(`https://api.github.com/users/${user.login}/starred`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
}

export async function createAndStar (username, repo) {
  const repoNode = await Repo.create({
    id: repo.id,
    name: repo.name
  })
  return Repo.star(username, repoNode.id)
}

export const findByUsername = (login) => {
  const session = db.session()
  const q = `
    MATCH (u:User { login: { login }})
    RETURN u
  `
  return session
    .run(q, { login })
    .then(result => {
      session.close()
      return result.records[0].get('u').properties
    })
}

export const findById = (id) => {
  const session = db.session()
  const q = `
    MATCH (u:User { id: { id }})
    RETURN u
  `
  return session
    .run(q, { id })
    .then(result => {
      session.close()
      return result.records[0].get('u').properties
    })
}

export const findOrCreate = ({ login }) => {
  const session = db.session()
  const q = `
    MERGE (u:User { login: { login }})
    RETURN u
  `
  return session
    .run(q, { login })
    .then(result => {
      session.close()
      return result.records[0].get('u').properties
    })
}


export async function createAndFollow (myLogin, friend){
  const friendNode = await create(friend)
  return follow(myLogin, friend.login)
}

export async function createFriendGraph (username) {
  const friends = await getFollowing(username)
  return Promise
    .map(friends, friend => {
      return createAndFollow(username, friend)
    })
    .each(f => {
      return Promise.map(getStarred(f), repo => {
        return createAndStar(f.login, repo)
      })
    })
}

export const createStarGraph = (user) => {
  return Promise.map(getStarred(user), repo => {
    return createAndStar(user.login, repo)
  })
}
