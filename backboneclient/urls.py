from django.conf.urls.defaults import patterns, include, url
import hyperadmin
from backboneclient.clients import BackboneClient

admin_client = BackboneClient(api_endpoint=hyperadmin.site)

urlpatterns = patterns('',
    url(r'^', include(admin_client.urls)),
)

