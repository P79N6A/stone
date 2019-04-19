const { ASTList } = require('./root-type')
const { NestedEnv } = require('../evaluator/environment')

class StoneObject {
  constructor(env) {
    this.env = env
  }
}

class ClassInfo {
  constructor(classStmnt, env) {
    this.definition = classStmnt
    this.env = env
    let obj = env.get(classStmnt.superClass)
    if (!obj) {
      this.super = null
    } else if (obj instanceof ClassInfo) {
      this.super = obj
    } else {
      throw new Error(`unkown super class: ${classStmnt.superClass}`)
    }
  }
  get name() {
    return this.definition.name
  }
  get superClass() {
    return this.super
  }
  get body() {
    return this.definition.body
  }
  get environment() {
    return this.env
  }
  toString() {
    return `<class ${this.name} >`
  }
}

class ClassBody extends ASTList {
  constructor(tokenList) {
    super(tokenList)
  }
  eval(env) {
    for (let cb of this) {
      cb.eval(env)
    }
    return null
  }
}

class ClassStmnt extends ASTList {
  constructor(tokenList) {
    super(tokenList)
  }
  get name() {
    return this.child(0).name
  }
  get superClass() {
    if (this.numChildren < 3) {
      return '*'
    }
    return this.child(1).name
  }
  get body() {
    return this.child(this.numChildren - 1)
  }
  toString() {
    let parent = this.superClass
    // parent = parent || '*'
    return `(class ${this.name} ${parent} ${this.body})`
  }
  eval(env) {
    let classInfo = new ClassInfo(this, env)
    env.put(this.name, classInfo)
    return this.name
  }
}

class Dot extends ASTList {
  constructor(tokenList) {
    super(tokenList)
  }
  get name() {
    return this.child(0).name
  }
  toString() {
    return `.${this.name}`
  }
  initObject(classInfo, env) {
    if (classInfo.superClass) {
      this.initObject(classInfo.superClass, env)
    }
    classInfo.body.eval(env)
  }
  eval(env, target) {
    let member = this.name
    if (target instanceof ClassInfo) {
      if (member === 'new') {
        let classInfo = target
        let nestEnv = new NestedEnv(env)
        let so = new StoneObject(nestEnv)
        nestEnv.putNew('this', so)
        this.initObject(classInfo, nestEnv)
        return so
      }
    }
  }
}

module.exports = {
  ClassBody,
  ClassStmnt,
  Dot,
}
