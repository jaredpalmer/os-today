import fetch from 'isomorphic-fetch'

export default (req, res, next) => {
  fetch(`https://api.github.com/users/jaredpalmer/starred?client_id=${process.env.GITHUB_ID}&client_secret=${process.env.GITHUB_SECRET}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(response => {
    res.status(200).json(response)
  })
  .catch(e => next(e))
}
