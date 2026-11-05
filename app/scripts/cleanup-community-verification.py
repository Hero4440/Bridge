"""Remove only fixtures belonging to the disposable IDs in a verification manifest; print counts only."""
import json, os, subprocess, sys
from pathlib import Path
manifest=json.loads(Path(sys.argv[1]).read_text())
accounts=manifest['accounts']
user_ids=[a['id'] for a in accounts if a.get('id')]
if not accounts or any(not a['email'].startswith(('bridge-community-','bridge-ui-')) or not a['email'].endswith('@example.com') for a in accounts):
    raise RuntimeError('Only disposable verification accounts may be cleaned up')
outputs=json.loads(Path(os.environ.get('BRIDGE_CLEANUP_OUTPUTS','amplify_outputs.json')).read_text())
def aws(service, operation, **args):
    result=subprocess.run(['aws',service,operation,'--region','us-east-1','--cli-input-json',json.dumps(args)],capture_output=True,text=True)
    if result.returncode:
        if operation=='scan' and 'ResourceNotFoundException' in result.stderr:return {}
        raise RuntimeError(f'{service} {operation} failed')
    return json.loads(result.stdout) if result.stdout.strip() else {}
identity=aws('sts','get-caller-identity')
if identity['Account']!='429367298232':raise RuntimeError('Unexpected AWS account')
api=next(a for a in aws('appsync','list-graphql-apis')['graphqlApis'] if a['uris']['GRAPHQL']==outputs['data']['url'])['apiId']
def owned(row):
    def val(key):return row.get(key,{}).get('S','')
    owner=val('owner').split('::')[0]
    participants=[x.get('S') for x in row.get('participants',{}).get('L',[])]
    return owner in user_ids or any(val(key) in user_ids for key in ['userId','senderId','creatorId','fromUserId','toUserId','contactId']) or any(p in user_ids for p in participants) or val('id') in user_ids or val('id')==manifest.get('fixture') or (val('id')==manifest.get('groupId') and val('name')=='Verification circle')
count=0
models=['RSVP','Event','User','TrustedContact','CheckIn','WeeklyGoal','CirclePresence','CircleMembership','ThreadState','EventPrep','DirectMessage','Message','MessageRequest','Contact','Notification','Reflection','Report','Group']
for model in models:
    table=f'{model}-{api}-NONE'
    start=None
    while True:
        args={'TableName':table,'ProjectionExpression':'id,#owner,userId,senderId,creatorId,fromUserId,toUserId,contactId,participants,#name','ExpressionAttributeNames':{'#owner':'owner','#name':'name'}}
        if start:args['ExclusiveStartKey']=start
        page=aws('dynamodb','scan',**args)
        for row in page.get('Items',[]):
            if owned(row):aws('dynamodb','delete-item',TableName=table,Key={'id':row['id']});count+=1
        start=page.get('LastEvaluatedKey')
        if not start:break
for account in accounts:aws('cognito-idp','admin-delete-user',UserPoolId=outputs['auth']['user_pool_id'],Username=account['email'])
print(json.dumps({'removedRecords':count,'removedAccounts':len(accounts)}))
Path(sys.argv[1]).unlink()
