for file in src/components/admin/*.tsx; do
  sed -i -E 's/allUsers\.filter/(allUsers || []).filter/g' "$file"
  sed -i -E 's/businesses\.filter/(businesses || []).filter/g' "$file"
  sed -i -E 's/ngos\.filter/(ngos || []).filter/g' "$file"
  sed -i -E 's/donations\.filter/(donations || []).filter/g' "$file"
  sed -i -E 's/orders\.filter/(orders || []).filter/g' "$file"
  sed -i -E 's/listings\.filter/(listings || []).filter/g' "$file"
  sed -i -E 's/auditLogs\.filter/(auditLogs || []).filter/g' "$file"
  sed -i -E 's/ledgers\.filter/(ledgers || []).filter/g' "$file"
  sed -i -E 's/settlements\.filter/(settlements || []).filter/g' "$file"
  sed -i -E 's/unreadNotifs\.filter/(unreadNotifs || []).filter/g' "$file"
  sed -i -E 's/notifications\.filter/(notifications || []).filter/g' "$file"
  sed -i -E 's/roleAuditLogs\.filter/(roleAuditLogs || []).filter/g' "$file"
  sed -i -E 's/filteredUsers\.filter/(filteredUsers || []).filter/g' "$file"
  sed -i -E 's/reservations\.filter/(reservations || []).filter/g' "$file"
  sed -i -E 's/radiusAuditLogs\.filter/(radiusAuditLogs || []).filter/g' "$file"
  
  sed -i -E 's/orders\.reduce/(orders || []).reduce/g' "$file"
done
