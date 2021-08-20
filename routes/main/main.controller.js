const pool = require('../../config/dbconnection');
const { yymmdd, } = require('../util')

const updateDown = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  let connection;
  try {
    connection = await pool.getConnection(async conn => conn);
    try {
      const downInsertSql = `INSERT INTO down (ip) values(?);`
      const downInsertParams = [ip];
      const [result] = await connection.execute(downInsertSql, downInsertParams)
      const data = {
        success: true,
        down: result.insertId
      }
      res.json(data);
    } catch (error) {
      console.log('Query Error');
      console.log(error)
      res.json(error)
    }
  } catch (error) {
    console.log('DB Error')
    console.log(error)
    res.json(error)
  } finally {
    connection.release();
  }


}
const updateHit = async (req, res) => {

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = yymmdd(new Date());
  let updatedAt;
  let hitID;

  let connection;
  try {
    connection = await pool.getConnection(async conn => conn);
    try {
      const hitSearchSql = `SELECT  id,date from hit where ip=?`
      const hitParams = [ip];
      const [hitInfo] = await connection.execute(hitSearchSql, hitParams)

      if (hitInfo.length !== 0) {
        updatedAt = yymmdd(hitInfo[0].date);
        hitID = hitInfo[0].id;
      }
      if (hitInfo.length === 0 || updatedAt !== now) {//upsert 구문 쓰는 법 알아볼것( primary key 가 하나여야한다는데??)
        if (hitInfo.length === 0) {
          const hitInsertSql = `INSERT INTO hit (ip,date) values(?,?);`
          const hitInsertParams = [ip, now];
          const [result] = await connection.execute(hitInsertSql, hitInsertParams)
        } else {
          const hitUpdateSql = `UPDATE hit SET date=? WHERE id=?;`
          const hitUpdateParams = [now, hitID];
          const [result] = await connection.execute(hitUpdateSql, hitUpdateParams)
        }
      }
      const hitSql = `SELECT COUNT(*) AS count FROM hit`
      const Params = [];
      const [hitResult] = await connection.execute(hitSql, Params)
      const downSql = `SELECT COUNT(*) AS count FROM down`
      const [downResult] = await connection.execute(downSql, Params)
      const data = {
        success: true,
        down: downResult[0].count,
        hit: hitResult[0].count,
      }
      res.json(data);
    } catch (error) {
      console.log('Query Error');
      console.log(error)
      res.json(error)
    }
  } catch (error) {
    console.log('DB Error')
    console.log(error)
    res.json(error)
  } finally {
    connection.release();
  }

}



module.exports = {
  updateDown,
  updateHit,

}