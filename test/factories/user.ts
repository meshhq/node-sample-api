import * as Factory from 'factory.ts'
import * as Faker from 'faker'
import User, { UserInterface } from '../../model/user'

const userFactory = Factory.makeFactory<UserInterface>({
	firstName: Factory.each((i) => Faker.lorem.words(4)),
	lastName: Factory.each((i) => Faker.lorem.words(4)),
	email: Factory.each((i) => Faker.lorem.words(4)),
})

let newUser = () => {
	return userFactory.build({})
}

let createUser = () => {
	let user = userFactory.build({})
	return User.create(user)
}

export { newUser as NewUser }
export { createUser as CreateUser }
