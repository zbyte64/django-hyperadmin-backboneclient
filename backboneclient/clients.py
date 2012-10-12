from hyperadmin.clients.common import SimpleTemplateClient

from backboneclient.mediatypes import CollectionBackboneClientJSON

class BackboneClient(SimpleTemplateClient):
    default_namespace = 'backboneclient'
    template_name = 'backboneclient/index.html'
    
    def __init__(self, *args, **kwargs):
        super(BackboneClient, self).__init__(*args, **kwargs)
        if hasattr(self.api_endpoint, 'register_media_type'):
            self.api_endpoint.register_media_type('application/vnd.Collection.hyperadmin.backboneclient+JSON', CollectionBackboneClientJSON)

