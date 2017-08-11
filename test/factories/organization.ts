import * as Factory from 'factory.ts'
import * as Faker from 'faker'

// Models
import Organization, { OrganizationInterface } from '../../model/organization'


const orgFactory = Factory.makeFactory<OrganizationInterface>({
	name: Factory.each((i) => Faker.lorem.words(4))
})

const newOrganization = () => {
	return orgFactory.build({})
}
const createOrganization = () => {
	const organization = orgFactory.build({})
	organization.name = Faker.company.companyName()
	return Organization.create(organization)
}

export { orgFactory as OrganizationFactory }
export { newOrganization as NewOrganization }
export { createOrganization as CreateOrganization }
