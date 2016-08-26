import neo4j from 'neo4j'
import GClient from 'github'

const db = new neo4j.GraphDatabase({
  url: process.env.GRAPHENEDB_URL || 'http://neo4j:neo5j@localhost:7474'
})

export const getFollowing = (login, token, cb) => {
  console.log(`getFollowing for ${login}`)
  const github = new GClient({})
  github.authenticate({ type: 'oauth', token })
  github.users.getFollowingForUser({user: login, per_page: 100}, getFollowing)

  // Recursively fetch the users someone follows
  let following = []
  function getFollowing (err, res) {
    if (err) {
      return cb(err, null)
    }

    following = following.concat(res)
    if (github.hasNextPage(res)) {
      setTimeout(() => {
        github.getNextPage(res, getFollowing)
      }, 2000)
    } else {
      console.log(following.map(friend => friend.login))
      console.log(`@${login} starred repos: ${following.length}`)
      cb(null, following)
    }
  }
}

export const getStarred = (login, token, cb) => {
  console.log(`getStarred for ${login}`)
  const github = new GClient({})
  github.authenticate({ type: 'oauth', token })
  github.activity.getStarredReposForUser({user: login, per_page: 100}, getRepos)

  // Recursively fetch a user's starredRepos
  let starredRepos = []
  function getRepos (err, res) {
    if (err) {
      return cb(err, null)
    }

    starredRepos = starredRepos.concat(res)
    if (github.hasNextPage(res)) {
      setTimeout(() => {
        github.getNextPage(res, getRepos)
      }, 2000)
    } else {
      console.log(starredRepos.map(repo => repo.full_name))
      console.log(`@${login} starred repos: ${starredRepos.length}`)
      cb(null, starredRepos)
    }
  }
}

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

export const findOrCreate = ({ login, id, avatar_url, followers, token, email }, cb) => {
  const query = `
    MERGE (u:User { login: { login } })
    ON MATCH SET u.avatar_url = {avatar_url}, u.followers = {followers}, u.token = {token}  ${email ? ', u.email = {email} ' : ''}
    ON CREATE SET u.id = {id}, u.avatar_url = {avatar_url}, u.followers = {followers}, u.token = {token} ${email ? ', u.email = {email} ' : ''}
    RETURN u
  `
  db.cypher({ query, params: { login, id, avatar_url, followers, token, email }, lean: true }, (err, result) => {
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
    ON MATCH SET u.id = f.id, u.avatar_url = f.avatar_url
    ON CREATE SET u.id = f.id, u.avatar_url = f.avatar_url
    WITH me, u
    WHERE (me:User) AND (u:User)
    MERGE (me)-[r:FOLLOWING]->(u)
    RETURN collect(u) AS data
  `
  db.cypher({ query, params: { login, friends }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result[0].data)
  })
}

// Onboard a new user (get their own stars and create edges)
export const createStarGraph = (login, token, cb) => {
  try {
    // Get your own stars
    getStarred(login, token, (err, repos) => {
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
        WITH u, repo
        WHERE (u:User) AND (repo:Repo)
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

// Find and create your friends, your friends' starred repos, and relevant edges
export const createSocialGraph = (login, token, cb) => {
  try {
    // Get the people you follow
    getFollowing(login, token, (err, friendList) => {
      if (err) throw err
      const friends = friendList.map(f => ({
        login: f.login,
        id: f.id,
        avatar_url: f.avatar_url
      }))
        // Add them to the graph
      findOrCreateUsersAndFollow(login, friends, (err, newFriends) => {
        if (err) throw err
        newFriends.forEach(n => {
          // Make their star graphs
          createStarGraph(n.login, token, cb)
        })
      })
    })
  } catch (e) {
    cb(e, null)
  }
}

export const getSuggestions = (login, skip, cb) => {
  const query = `
  MATCH (me:User {login: { login }})-[f:FOLLOWING]->(u:User)-[l:STARRED]->(repo:Repo)
  WHERE NOT (me)-[:STARRED]->(repo)
  RETURN repo, count(l) AS likes, collect(u.login) AS friends
  ORDER BY likes DESC
  SKIP {skip}
  LIMIT 50
  `
  db.cypher({ query, params: { login, skip }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result)
  })
}

export const getPopular = (login, cb) => {
  const query = `
  MATCH (me:User {login: { login }})-[f:FOLLOWING]->(u:User)-[l:STARRED]->(repo:Repo)
  RETURN repo, count(l) AS likes, collect(u.login) AS friends
  ORDER BY likes DESC
  LIMIT 50
  `
  db.cypher({ query, params: { login }, lean: true }, (err, result) => {
    if (err) cb(err, null)
    cb(null, result)
  })
}
