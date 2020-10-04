import graphene


class User(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()


class Query(graphene.ObjectType):
    users = graphene.List(User)

    def resolve_users(self, info):
        return [
            {'id': 1, 'name': 'Theo Von'},
            {'id': 2, "name": "Tom Segura"},
            {'id': 3, "name": "Eric Andre"},
            {'id': 4, "name": "Andrew Santino"},
        ]


schema = graphene.Schema(query=Query)
