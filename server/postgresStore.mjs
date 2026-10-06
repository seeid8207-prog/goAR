import pg from 'pg';
const { Pool } = pg;

export function createPostgresStore(connectionString){
  const pool=new Pool({connectionString});

  return {
    async close(){await pool.end();},

    async getTicket(id){
      const {rows}=await pool.query(
        `SELECT t.id,t.event_id AS "eventId",e.name AS "eventName",e.venue_id AS "venueId",
                v.name AS "venueName",t.section,t.row_label AS "row",t.seat_label AS "seat",t.holder_name AS "holderName"
         FROM tickets t
         JOIN events e ON e.id=t.event_id
         JOIN venues v ON v.id=e.venue_id
         WHERE t.id=$1`,[id]
      );
      return rows[0]??null;
    },

    async getMapping(venueId){
      const {rows}=await pool.query(
        `SELECT payload FROM mapping_versions
         WHERE venue_id=$1 AND published=true
         ORDER BY version DESC LIMIT 1`,[venueId]
      );
      return rows[0]?.payload??null;
    },

    async putMapping(venueId,dataset){
      await pool.query('BEGIN');
      try{
        const {rows}=await pool.query(
          'SELECT COALESCE(MAX(version),0)+1 AS version FROM mapping_versions WHERE venue_id=$1 FOR UPDATE',
          [venueId]
        );
        const version=Number(rows[0].version);
        await pool.query('UPDATE mapping_versions SET published=false WHERE venue_id=$1',[venueId]);
        await pool.query(
          `INSERT INTO mapping_versions(id,venue_id,version,published,payload)
           VALUES(gen_random_uuid(),$1,$2,true,$3::jsonb)`,
          [venueId,version,JSON.stringify(dataset)]
        );
        await pool.query('COMMIT');
        return {venueId,version,points:dataset.points.length};
      }catch(error){
        await pool.query('ROLLBACK');
        throw error;
      }
    },

    async recordNavigationEvent(event){
      await pool.query(
        `INSERT INTO navigation_events(venue_id,event_name,session_id,payload)
         VALUES($1,$2,$3,$4::jsonb)`,
        [event.venueId??null,event.name,event.sessionId??null,JSON.stringify(event)]
      );
    }
  };
}
