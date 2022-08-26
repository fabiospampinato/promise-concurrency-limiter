
/* IMPORT */

import {describe} from 'fava';
import Limiter from '../dist/index.js';

/* MAIN */

describe ( 'Limiter', it => {

  it ( 'works', async t => {

    let count = 0;

    const increment = () => {
      return new Promise ( resolve => {
        setTimeout ( () => {
          count += 1;
          resolve ();
        }, 1 );
      });
    }

    const limiter = new Limiter ({
      concurrency: 10
    });

    t.is ( limiter.concurrency, 10 );
    t.is ( limiter.count, 0 );
    t.is ( limiter.queue.size, 0 );

    for ( let i = 0, l = 1000; i < l; i++ ) {
      limiter.add ( increment );
    }

    t.is ( limiter.count, 10 );
    t.is ( limiter.queue.size, 990 );
    t.is ( count, 0 );

    return new Promise ( resolve => {

      setTimeout ( () => {

        t.is ( limiter.count, 0 );
        t.is ( limiter.queue.size, 0 );
        t.is ( count, 1000 );

        resolve ();

      }, 2000 );

    });

  });

  it ( 'no deadlock', async t => {

    const limiter = new Limiter ({
      concurrency: 1
    });

    const maxDepth = 2;

    const handleDirectory = ( rootPath, path, depth ) => {
      const subPath = `${rootPath}/${path}`;
      if ( depth >= maxDepth ) return Promise.resolve ( subPath );
      return limiter.add ( () => populateResultFromPath ( subPath, depth + 1 ) );
    };

    const handleDirents = ( rootPath, dirents, depth ) => {
      return Promise.all ( dirents.map ( dirent => handleDirectory ( rootPath, dirent, depth ) ) );
    };

    const populateResultFromPath = ( rootPath, depth ) => handleDirents ( rootPath, ['a', 'b'], depth );

    t.deepEqual ( await populateResultFromPath ( '', 0 ), [
      [ [ '/a/a/a', '/a/a/b' ], [ '/a/b/a', '/a/b/b' ] ],
      [ [ '/b/a/a', '/b/a/b' ], [ '/b/b/a', '/b/b/b' ] ]
    ]);

  });

});
