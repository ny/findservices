## This is a jq script with some notes to myself on how to run it. This is
## temporary until I implement a proper solution to synchronization data between
## the database and application.yaml.

## recursively merges all files named `application.yaml` (assumes 7)
# find . -name application.yaml | xargs yq -s '.[0] * .[1] * .[2] * .[3] * .[4] .[5] * .[6]' > application.json

## extract ranks
# jq '.maslow.catalog.rank | { rank: . }' application.json > rank.json

## extract services
# jq '.maslow.catalog.services | { services: . }' application.json > services.json

## combine ranks and services into ServiceDocument json
# jq -s -f ServiceDocument.jq rank.json services.json

(
  .[0].rank
  | to_entries
  | map({ (.value): { key: .value, rank: .key, modified: now | todate } })
  | add
  | { services: . }
) * (
  .[1]
)
| { modified: now | todate, services: .services }
