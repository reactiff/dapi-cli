// CMD: APP

function build(yargs, scope) {

  return yargs
    .positional('verb', { 
      describe: 'action to take',
      type: 'string',
    })
    .positional('name', { 
      describe: 'target app name',
      type: 'string',
    })
    
}
function handle(argv, scope) {

  scope.messageBox('app',
    `> api app ${argv.verb} ${argv.name}`
  );
  return;


  const { boxen } = scope;
  
  //if (argv.verbose)
  if (!argv.verb) {
    scope.messageBox(
      `Umm...`, 
      `> api app select|list|create|update|delete`
    );
    return;
  }
  console.info(
    `${argv.verb} ${argv.verb === "list" ? "apps" : "an app"}`
  );
}

export default {
  build,
  handle,
}