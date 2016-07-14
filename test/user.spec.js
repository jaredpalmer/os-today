// /* eslint-env mocha */
// import expect from 'expect'
// import * as User from '../server/models/user'
// import * as helper from './test-helper'
//
// describe('User Model', () => {
//   beforeEach(helper.resetDB)
//
//   // it('should create a new user', (done) => {
//   //   const userData = {
//   //     login: 'jaredpalmer',
//   //     id: 4060187
//   //   }
//   //   User.create(userData)
//   //     .then(user => {
//   //       expect(user).toEqual(userData)
//   //       done()
//   //     })
//   //     .catch(e => done(e))
//   // })
//   //
//   // it('should create a follow relationship', (done) => {
//   //   const me = {
//   //     login: 'jaredpalmer',
//   //     id: 4060187
//   //   }
//   //   const friend = {
//   //     login: 'friend',
//   //     id: 4060188
//   //   }
//   //   User.create(me).then(m => {
//   //     expect(m).toEqual(me)
//   //     return User.create(friend)
//   //   }).then((f) => {
//   //     expect(f).toEqual(friend)
//   //     return User.follow(me, friend)
//   //   }).then((res) => {
//   //     done()
//   //   }).catch(e => done(e))
//   // })
//
//   it('should create and follow relationship', function (done)  {
//     this.timeout(5000);
//     const me = {
//       login: 'jaredpalmer',
//       id: 4060187
//     }
//     const f = {
//       login: 'brentpalmer',
//       id: 4060187
//     }
//
//       User.create(me).then(user => {
//           expect(user).toEqual(me)
//           return User.createStarGraph(me)
//       }).then(() => {
//         return User.createFriendGraph(me.login)
//         done()
//       })
//       .catch(e => done(e))
//   })
// })
