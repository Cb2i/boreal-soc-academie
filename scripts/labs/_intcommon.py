CONN_NOTE='Facultatif. Utilisez uniquement un locataire de test, jamais un locataire de production.'
def conn(acc, cleanup, lim=CONN_NOTE):
    return dict(accounts=acc, permissions='Rôle Intune adapté (par exemple Policy and Profile Manager) dans le locataire de test.', costs='Licences de test à votre charge ; vérifiez la tarification actuelle.', secrets='Aucun secret dans le dépôt.', cleanup=cleanup, limits=lim)

