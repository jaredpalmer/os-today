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


export const findOrCreateUsersAndFollow = (login, friends, cb) => {
  const query = `
    MATCH (me:User { login: { login } })
    UNWIND {friends} AS f
    MERGE (u:User { login: f.login })
    ON MATCH SET u.avatar_url = f.avatar_url, u.followers = f.followers, u.name = f.name
    ON CREATE SET u.avatar_url = f.avatar_url, u.followers = f.followers, u.name = f.name
    MERGE (me)-[r:FOLLOWING]->(u)
    RETURN collect(u) AS data
  `
  db.cypher({ query, params: { login, friends }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result[0].data)
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
    getStarred(login, token, page, (err, repos) => {
      if (err) throw err
      // only want to save the things we need
      const starredRepos = repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        url: repo.url,
        html_url: repo.html_url,
        description: repo.description,
        avatar_url: repo.owner.avatar_url,
        stargazers_count: repo.stargazers_count
      }))
      const query = `
        MATCH (u:User { login: { login } })
        UNWIND {starredRepos} AS r
        MERGE (repo:Repo { id: r.id })
        ON CREATE SET repo.name = r.name, repo.description = r.description, repo.full_name = r.full_name, repo.avatar_url = r.avatar_url, repo.url = r.url, repo.html_url = r.html_url, repo.stargazers_count = r.stargazers_count
        ON MATCH SET repo.name = r.name, repo.description = r.description, repo.full_name = r.full_name, repo.avatar_url = r.avatar_url, repo.url = r.url, repo.html_url = r.html_url, repo.stargazers_count = r.stargazers_count
        MERGE (u)-[s:STARRED]->(repo)
        RETURN collect(repo) AS data
      `
      db.cypher({ query, params: { login, starredRepos }, lean: true }, (err, result) => {
          if (err) cb(err, null)
          cb(null, result[0].data)
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
      const friends = friendList.map(f => ({
          login: f.login,
          id: f.id,
          followers: f.followers,
          avatar_url: f.avatar_url
      }))
        // Add them to the graph
      findOrCreateUsersAndFollow(login, friends, (err, newFriends) => {
          if (err) throw err
          console.log(newFriends)
          // Get their stars
          newFriends.forEach(n => {
            getStarred(n.login, token, 0, (err, repos) => {
              if (err) throw err
              // only want to save the things we need
              repos.forEach(repo => {
                  Repo.findOrCreateRepoAndStar(n.login, {
                    id: repo.id,
                    name: repo.name,
                    full_name: repo.full_name,
                    url: repo.url,
                    html_url: repo.html_url,
                    description: repo.description,
                    avatar_url: repo.owner.avatar_url,
                    stargazers_count: repo.stargazers_count
                  }, (err, newRepo) => {
                    cb(err, newRepo)
                  })
              })
          })
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
  WHERE NOT (me)-[:STARRED]->(repo)
  RETURN repo, count(l) AS likes
  ORDER BY likes DESC
  LIMIT 50
  `
  db.cypher({ query, params: { login }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result)
  })
}
