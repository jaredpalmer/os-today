import db from './db'
import * as Repo from './repo'
import request from 'superagent'

export const create = (options, cb) => {
  const query = `
    CREATE (u:User { options })
    RETURN u
  `
  db.cypher({ query, params: options, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result[0].u)
  })
}

export const findByUsername = (login, cb) => {
  const query = `
    MATCH (u:User { login: { login }})
    RETURN u
  `
  db.cypher({ query, params: { login }, lean: true }, (err, result) => {
    if (err) {
      console.log(err)
      cb(err, null)
    }
    cb(null, result[0].u)
  })
}

export const findById = (id, cb) => {
  const query = `
    MATCH (u:User { id: { id }})
    RETURN u
  `
  db.cypher({ query, params: { id }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result[0].u)
  })
}

export const findOrCreate = ({ login, id, avatar_url, followers, email }, cb) => {
  const query = `
    MERGE (u:User { login: { login } })
    ON MATCH SET u.avatar_url = {avatar_url}, u.followers = {followers}, u.email = {email}
    ON CREATE SET u.id = {id}, u.avatar_url = {avatar_url}, u.followers = {followers}, u.email = {email}
    RETURN u
  `
  db.cypher({ query, params: { login, id, avatar_url, followers, email }, lean: true }, (err, result) => {
    if (err) {
      console.log(err)
      cb(err, null)
    }
    cb(null, result[0].u)
  })
}


export const findOrCreateUserAndFollow = (myLogin, friend, cb) => {
  const query = `
    MATCH (u:User { login: { myLogin } })
    MERGE (f:User { login: { login } })
    ON CREATE SET f.id = {id}, f.avatar_url = {avatar_url}, f.followers = {followers}
    MERGE (u)-[r:FOLLOWING]->(f)
    RETURN f
  `
  const { login, id, avatar_url, followers } = friend
  db.cypher({ query, params: { myLogin, login, id, avatar_url, followers }, lean: true }, (err, result) => {
    if (err) {
      console.log(err)
      cb(err, null)
    }
    cb(null, result[0].f)
  })
}



export const getFollowing = (login, token, cb) => {
  // request(`https://api.github.com/users/${login}/following?per_page=100&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`, (err, res) => {
  request(`https://api.github.com/users/${login}/following?per_page=90&access_token=${token}`, (err, res) => {
    if (err) cb(err, null)
    cb(null, res.body)
  })
}

export const getStarred = (login, token, page, cb) => {
  // request(`https://api.github.com/users/${login}/starred?per_page=100&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`, (err, res) => {
  request(`https://api.github.com/users/${login}/starred?per_page=30&page=${page}&access_token=${token}`, (err, res) => {
    if (err) cb(err, null)
    cb(null, res.body)
  })
}

export const follow = (myLogin, friendLogin, cb) => {
  const query = `
    MATCH (u:User { login: { myLogin } }), (f:User { login: { friendLogin } })
    MERGE (u)-[r:FOLLOWING]->(f)
    RETURN f
  `
  db.cypher({ query, params: { myLogin, friendLogin }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result[0].f)
  })
}

// Onboard a new user (get their own stars and create edges)
export const createStarGraph = (login, token, page, cb) => {
  try {
    // Get your own stars
    getStarred(login, token, page, (err, starredRepos) => {
      if (err) throw err
      starredRepos.map(repo => {
        // Add any new repos to graph
        Repo.findOrCreateRepoAndStar(login, {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          description: repo.description,
          avatar_url: repo.owner.avatar_url,
          stargazers_count: repo.stargazers_count
        }, (err, newRepo) => {
          console.log(`${login} starred ${newRepo.name}`)
          cb(err, newRepo)
        })
      })
    })
  } catch (e) {
    console.log(e)
    cb(e, null)
  }
}

// Find and create your friends, their starred repos, and relevant edges
export const createSocialGraph = (login, token, cb) => {
  try {
    // Get the people you follow
    getFollowing(login, token, (err, friendList) => {
      if (err) throw err
      friendList.map(friend => {
        // Add them to the graph
        findOrCreateUserAndFollow(login, friend, (err, friend) => {
            if (err) throw err
            // Get their stars
            createStarGraph(friend.login, token, 0, cb)
        })
      })
    })
  } catch (e) {
    cb(e, null)
  }
}

export const getSuggestions = (login, cb) => {
  const query = `
  MATCH (me:User {login: { login }})-[f:FOLLOWING]->(u:User)-[l:STARRED]->(repo:Repo)
  RETURN repo, count(l) AS likes
  ORDER BY likes DESC
  LIMIT 50
  `
  db.cypher({ query, params: { login }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result)
  })
}
