from hyperadmin.mediatypes.collectionjson import CollectionHyperAdminJSON

class CollectionBackboneClientJSON(CollectionHyperAdminJSON):
    recognized_media_types = [
        'application/vnd.Collection.hyperadmin.backboneclient+JSON'
    ]

